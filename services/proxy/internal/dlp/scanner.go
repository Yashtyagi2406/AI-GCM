package dlp

import (
	"regexp"
	"strings"
)

// ScanResult contains DLP scan findings.
type ScanResult struct {
	HasViolation bool
	Violations   []Violation
}

type Violation struct {
	Type       string // "pii" | "phi" | "custom"
	Pattern    string
	Severity   string // "critical" | "high" | "medium"
	Redacted   string // prompt with PII replaced by [REDACTED]
}

// Scanner scans prompt text for sensitive data patterns.
type Scanner struct {
	patterns []*compiledPattern
}

type compiledPattern struct {
	name     string
	category string
	severity string
	re       *regexp.Regexp
}

// NewScanner initialises a scanner with built-in PII + PHI patterns.
func NewScanner() *Scanner {
	patterns := []struct {
		name, category, severity, pattern string
	}{
		{"email", "pii", "medium", `[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}`},
		{"us_ssn", "pii", "critical", `\b\d{3}-\d{2}-\d{4}\b`},
		{"credit_card", "pii", "critical", `\b(?:\d{4}[- ]){3}\d{4}\b`},
		{"us_phone", "pii", "medium", `\b(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b`},
		{"ipv4", "pii", "low", `\b(?:\d{1,3}\.){3}\d{1,3}\b`},
	}

	s := &Scanner{}
	for _, p := range patterns {
		re, err := regexp.Compile(p.pattern)
		if err != nil {
			continue
		}
		s.patterns = append(s.patterns, &compiledPattern{
			name: p.name, category: p.category,
			severity: p.severity, re: re,
		})
	}
	return s
}

// Scan checks prompt for sensitive data and returns findings.
func (s *Scanner) Scan(prompt string) *ScanResult {
	result := &ScanResult{}
	redacted := prompt

	for _, p := range s.patterns {
		if p.re.MatchString(prompt) {
			result.HasViolation = true
			result.Violations = append(result.Violations, Violation{
				Type:     p.category,
				Pattern:  p.name,
				Severity: p.severity,
			})
			redacted = p.re.ReplaceAllString(redacted, "["+strings.ToUpper(p.name)+"-REDACTED]")
		}
	}
	result.Violations = appendRedacted(result.Violations, redacted)
	return result
}

func appendRedacted(violations []Violation, redacted string) []Violation {
	for i := range violations {
		violations[i].Redacted = redacted
	}
	return violations
}
