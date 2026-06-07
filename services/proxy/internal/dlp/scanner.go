package dlp

import (
	"regexp"
	"strings"
)

// ScanResult contains DLP scan findings.
type ScanResult struct {
	HasViolation bool
	PHIDetected  bool // true if any PHI pattern matched (for HIPAA compliance mode)
	Violations   []Violation
	RedactedText string // full prompt with all sensitive data replaced
}

// Violation is a single pattern match finding.
type Violation struct {
	Type     string // "pii" | "phi" | "custom"
	Pattern  string // pattern name e.g. "us_ssn"
	Severity string // "critical" | "high" | "medium" | "low"
}

// Scanner scans prompt text for PII, PHI, and custom sensitive data patterns.
// SRS §4.3.2: PII Detection (email, SSN, CC, phone) + PHI Detection (HIPAA patterns).
type Scanner struct {
	patterns []*compiledPattern
}

type compiledPattern struct {
	name     string
	category string // "pii" | "phi" | "custom"
	severity string
	re       *regexp.Regexp
}

// NewScanner initialises a scanner with built-in PII + PHI patterns per SRS §4.3.2.
func NewScanner() *Scanner {
	defs := []struct {
		name, category, severity, pattern string
	}{
		// ── PII patterns ──────────────────────────────────────────────────────
		{"email", "pii", "medium", `[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}`},
		{"us_ssn", "pii", "critical", `\b\d{3}-\d{2}-\d{4}\b`},
		{"credit_card", "pii", "critical", `\b(?:\d{4}[- ]){3}\d{4}\b`},
		{"us_phone", "pii", "medium", `\b(\+1[-.\ s]?)?\(?\d{3}\)?[-.\ s]\d{3}[-.\ s]\d{4}\b`},
		{"ipv4", "pii", "low", `\b(?:\d{1,3}\.){3}\d{1,3}\b`},
		{"passport", "pii", "critical", `\b[A-Z]{1,2}\d{6,9}\b`},
		{"drivers_license", "pii", "high", `\b[A-Z]{1,2}\d{6,8}\b`},

		// ── PHI patterns (HIPAA) §4.3.2 ──────────────────────────────────────
		// National Provider Identifier — 10-digit number
		{"npi", "phi", "critical", `\bNPI[:\s#]*\d{10}\b`},
		// DEA registration number — 2 letters + 7 digits
		{"dea_number", "phi", "critical", `\b[A-Z]{2}\d{7}\b`},
		// ICD-10 diagnosis codes — letter + 2 digits + optional decimal + up to 4 more
		{"icd10_code", "phi", "high", `\b[A-Z]\d{2}\.?\d{0,4}\b`},
		// Medical Record Number — MRN/medical-record context keyword + digits
		{"mrn", "phi", "critical", `\b(?:MRN|medical record|patient[- ]?id)[:\s#]*\d{4,12}\b`},
		// Insurance member ID
		{"insurance_id", "phi", "high", `\b(?:member[- ]?id|policy[- ]?number)[:\s#]*[A-Z0-9]{6,15}\b`},
		// Date of birth — multiple formats
		{"dob", "phi", "high", `\b(?:DOB|date of birth|born)[:\s]*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b`},
	}

	s := &Scanner{}
	for _, d := range defs {
		re, err := regexp.Compile(`(?i)` + d.pattern)
		if err != nil {
			continue
		}
		s.patterns = append(s.patterns, &compiledPattern{
			name:     d.name,
			category: d.category,
			severity: d.severity,
			re:       re,
		})
	}
	return s
}

// AddCustomPattern adds an org-specific regex pattern to the scanner.
func (s *Scanner) AddCustomPattern(name, category, severity, pattern string) error {
	re, err := regexp.Compile(`(?i)` + pattern)
	if err != nil {
		return err
	}
	s.patterns = append(s.patterns, &compiledPattern{
		name:     name,
		category: category,
		severity: severity,
		re:       re,
	})
	return nil
}

// Scan checks prompt for sensitive data and returns findings with redacted text.
func (s *Scanner) Scan(prompt string) *ScanResult {
	result := &ScanResult{RedactedText: prompt}

	for _, p := range s.patterns {
		if p.re.MatchString(prompt) {
			result.HasViolation = true
			if p.category == "phi" {
				result.PHIDetected = true
			}
			result.Violations = append(result.Violations, Violation{
				Type:     p.category,
				Pattern:  p.name,
				Severity: p.severity,
			})
			result.RedactedText = p.re.ReplaceAllString(
				result.RedactedText,
				"["+strings.ToUpper(p.name)+"-REDACTED]",
			)
		}
	}
	return result
}

// HighestSeverity returns the most severe violation level found.
func (r *ScanResult) HighestSeverity() string {
	order := map[string]int{"critical": 4, "high": 3, "medium": 2, "low": 1}
	best := ""
	bestVal := 0
	for _, v := range r.Violations {
		if order[v.Severity] > bestVal {
			bestVal = order[v.Severity]
			best = v.Severity
		}
	}
	return best
}
