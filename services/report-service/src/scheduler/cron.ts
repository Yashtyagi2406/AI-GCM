/**
 * Monthly report scheduler using node-cron.
 * Fires on the 1st of every month at 08:00 UTC and generates
 * monthly cost reports for all active organizations.
 */
import cron from 'node-cron';
import { Pool } from 'pg';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { generateReport } from '../index.js';

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrgRecord {
  id: string;
  name: string;
  billing_email: string;
}

// ── Scheduler ─────────────────────────────────────────────────────────────────

/**
 * startMonthlyScheduler initialises the cron job that fires on the 1st of
 * each month at 08:00 UTC. It generates a monthly_cost PDF report for every
 * active organisation.
 *
 * Returns a cron.ScheduledTask so the caller can stop it on shutdown.
 */
export function startMonthlyScheduler(pool: Pool): cron.ScheduledTask {
  // "0 8 1 * *" = minute 0, hour 8, day-of-month 1, any month, any weekday
  const task = cron.schedule('0 8 1 * *', async () => {
    console.log('[report-scheduler] monthly report generation started');

    const lastMonth = subMonths(new Date(), 1);
    const periodStart = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
    const periodEnd   = format(endOfMonth(lastMonth), 'yyyy-MM-dd');

    let orgs: OrgRecord[];
    try {
      const result = await pool.query<OrgRecord>(
        `SELECT id, name, billing_email FROM organizations WHERE is_active = TRUE`,
      );
      orgs = result.rows;
    } catch (err) {
      console.error('[report-scheduler] failed to fetch orgs:', err);
      return;
    }

    console.log(`[report-scheduler] generating reports for ${orgs.length} orgs (${periodStart} → ${periodEnd})`);

    for (const org of orgs) {
      try {
        await generateReport({
          orgId:       org.id,
          orgName:     org.name,
          reportType:  'monthly_cost',
          format:      'pdf',
          periodStart,
          periodEnd,
          requestedBy: null,  // system-triggered
        });
        console.log(`[report-scheduler] ✓ ${org.name} (${org.id})`);
      } catch (err) {
        console.error(`[report-scheduler] ✗ ${org.name}:`, err);
      }
    }

    console.log('[report-scheduler] monthly batch complete');
  }, {
    scheduled: true,
    timezone: 'UTC',
  });

  console.log('[report-scheduler] monthly cron registered (0 8 1 * * UTC)');
  return task;
}
