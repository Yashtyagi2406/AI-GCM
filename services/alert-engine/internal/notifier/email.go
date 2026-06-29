// Package notifier sends alert notifications via email (SMTP).
// SRS §12.2 Month 2: "Simple budget: per-org monthly limit with email alert at 90%."
package notifier

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
	"strings"
)

// EmailConfig holds SMTP connection details loaded from environment variables.
type EmailConfig struct {
	Host     string // SMTP_HOST
	Port     string // SMTP_PORT (default: 587)
	Username string // SMTP_USERNAME
	Password string // SMTP_PASSWORD
	From     string // SMTP_FROM_ADDRESS
}

// LoadEmailConfig reads SMTP settings from environment.
func LoadEmailConfig() EmailConfig {
	return EmailConfig{
		Host:     getEnv("SMTP_HOST", "smtp.gmail.com"),
		Port:     getEnv("SMTP_PORT", "587"),
		Username: getEnv("SMTP_USERNAME", ""),
		Password: getEnv("SMTP_PASSWORD", ""),
		From:     getEnv("SMTP_FROM_ADDRESS", "noreply@ai-gcm.io"),
	}
}

// EmailSender sends transactional emails via SMTP.
type EmailSender struct {
	cfg EmailConfig
}

// NewEmailSender creates an EmailSender.
func NewEmailSender(cfg EmailConfig) *EmailSender {
	return &EmailSender{cfg: cfg}
}

// AlertEmail holds the data for a budget alert email.
type AlertEmail struct {
	To             string  // recipient email address
	OrgName        string
	Severity       string
	BudgetName     string
	UtilizationPct float64
	SpentUSD       float64
	LimitUSD       float64
	RemainingUSD   float64
}

// SendBudgetAlert sends a budget threshold alert email.
// If SMTP is not configured (empty host/credentials), it logs the alert instead.
func (s *EmailSender) SendBudgetAlert(alert AlertEmail) {
	if s.cfg.Username == "" || s.cfg.Password == "" {
		log.Printf("[notifier] DEV MODE — budget alert not sent (SMTP not configured)\n"+
			"  To: %s | Org: %s | Budget: %s | Utilization: %.1f%% | Spent: $%.2f / $%.2f",
			alert.To, alert.OrgName, alert.BudgetName,
			alert.UtilizationPct, alert.SpentUSD, alert.LimitUSD)
		return
	}

	subject := fmt.Sprintf("[AI-GCM %s] Budget Alert: %s at %.0f%%",
		strings.ToUpper(alert.Severity), alert.BudgetName, alert.UtilizationPct)

	body := fmt.Sprintf(`From: AI-GCM Platform <%s>
To: %s
Subject: %s
Content-Type: text/plain; charset=utf-8

Hi,

This is an automated budget alert from AI-GCM.

Organization : %s
Budget Name  : %s
Severity     : %s
Utilization  : %.1f%%
Spent MTD    : $%.2f
Budget Limit : $%.2f
Remaining    : $%.2f

Please log in to your AI-GCM dashboard to review usage and take action:
https://app.ai-gcm.io/budgets

— AI-GCM Platform
`,
		s.cfg.From, alert.To, subject,
		alert.OrgName, alert.BudgetName, strings.ToUpper(alert.Severity),
		alert.UtilizationPct, alert.SpentUSD, alert.LimitUSD, alert.RemainingUSD,
	)

	addr := s.cfg.Host + ":" + s.cfg.Port
	auth := smtp.PlainAuth("", s.cfg.Username, s.cfg.Password, s.cfg.Host)

	if err := smtp.SendMail(addr, auth, s.cfg.From, []string{alert.To}, []byte(body)); err != nil {
		log.Printf("[notifier] failed to send budget alert email to %s: %v", alert.To, err)
		return
	}
	log.Printf("[notifier] budget alert email sent to %s (%.0f%% of %s)",
		alert.To, alert.UtilizationPct, alert.BudgetName)
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
