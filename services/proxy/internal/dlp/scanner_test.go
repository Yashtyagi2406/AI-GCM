package dlp_test

import (
	"strings"
	"testing"

	"github.com/ai-gcm/proxy/internal/dlp"
)

func TestScanCleanText(t *testing.T) {
	s := dlp.NewScanner()
	result := s.Scan("What is the weather like today in London?")
	if result.HasViolation {
		t.Errorf("expected no violation, got: %+v", result.Violations)
	}
	if result.PHIDetected {
		t.Error("expected PHIDetected=false for clean text")
	}
}

func TestScanEmailPII(t *testing.T) {
	s := dlp.NewScanner()
	result := s.Scan("Please send the invoice to john.doe@example.com asap")
	if !result.HasViolation {
		t.Fatal("expected violation for email address")
	}
	found := false
	for _, v := range result.Violations {
		if v.Pattern == "email" {
			found = true
		}
	}
	if !found {
		t.Fatal("expected 'email' pattern in violations")
	}
}

func TestScanSSNCritical(t *testing.T) {
	s := dlp.NewScanner()
	result := s.Scan("My social security number is 123-45-6789")
	if !result.HasViolation {
		t.Fatal("expected SSN violation")
	}
	if result.HighestSeverity() != "critical" {
		t.Errorf("expected critical severity for SSN, got %s", result.HighestSeverity())
	}
}

func TestScanCreditCard(t *testing.T) {
	s := dlp.NewScanner()
	result := s.Scan("charge card number 4111 1111 1111 1111 for $99")
	if !result.HasViolation {
		t.Fatal("expected credit card violation")
	}
}

func TestScanPHIMRN(t *testing.T) {
	s := dlp.NewScanner()
	result := s.Scan("Patient MRN: 1234567 admitted with chest pain")
	if !result.HasViolation {
		t.Fatal("expected PHI violation for MRN")
	}
	if !result.PHIDetected {
		t.Fatal("expected PHIDetected=true for MRN")
	}
}

func TestScanRedaction(t *testing.T) {
	s := dlp.NewScanner()
	result := s.Scan("email is test@example.com please call")
	if !strings.Contains(result.RedactedText, "REDACTED") {
		t.Errorf("expected redacted text, got: %s", result.RedactedText)
	}
	if strings.Contains(result.RedactedText, "test@example.com") {
		t.Error("original PII should be redacted from RedactedText")
	}
}

func TestScanMultipleViolations(t *testing.T) {
	s := dlp.NewScanner()
	result := s.Scan("SSN 123-45-6789 and email foo@bar.com")
	if len(result.Violations) < 2 {
		t.Errorf("expected at least 2 violations, got %d", len(result.Violations))
	}
}

func TestScanCustomPattern(t *testing.T) {
	s := dlp.NewScanner()
	if err := s.AddCustomPattern("internal_id", "custom", "high", `EMP-\d{6}`); err != nil {
		t.Fatalf("AddCustomPattern error: %v", err)
	}
	result := s.Scan("Employee EMP-123456 submitted request")
	if !result.HasViolation {
		t.Fatal("expected custom pattern violation")
	}
}
