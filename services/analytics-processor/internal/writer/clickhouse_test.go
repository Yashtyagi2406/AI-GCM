package writer

import (
	"encoding/hex"
	"testing"
)

func TestParseUUIDValid(t *testing.T) {
	uuidStr := "4a51e604-05cf-4dfb-bb66-bd97858c4266"
	res := parseUUID(uuidStr)
	resHex := hex.EncodeToString(res[:])
	
	// Strip hyphens from original uuid to compare hex representations
	expectedHex := "4a51e60405cf4dfbbb66bd97858c4266"
	if resHex != expectedHex {
		t.Errorf("parseUUID(%s) expected hex %s, got %s", uuidStr, expectedHex, resHex)
	}
}

func TestParseUUIDEmpty(t *testing.T) {
	res := parseUUID("")
	expected := [16]byte{}
	if res != expected {
		t.Errorf("parseUUID(\"\") expected empty array, got %v", res)
	}
}

func TestParseUUIDInvalid(t *testing.T) {
	res := parseUUID("invalid-uuid-string")
	expected := [16]byte{}
	if res != expected {
		t.Errorf("parseUUID(invalid) expected zero array, got %v", res)
	}
}

func TestParseNullableUUIDValid(t *testing.T) {
	uuidStr := "4a51e604-05cf-4dfb-bb66-bd97858c4266"
	res := parseNullableUUID(uuidStr)
	if res == nil {
		t.Fatal("parseNullableUUID expected non-nil result for valid UUID")
	}
	resHex := hex.EncodeToString(res[:])
	expectedHex := "4a51e60405cf4dfbbb66bd97858c4266"
	if resHex != expectedHex {
		t.Errorf("parseNullableUUID(%s) expected hex %s, got %s", uuidStr, expectedHex, resHex)
	}
}

func TestParseNullableUUIDEmpty(t *testing.T) {
	res := parseNullableUUID("")
	if res != nil {
		t.Errorf("parseNullableUUID(\"\") expected nil, got %v", res)
	}
}

func TestParseNullableUUIDInvalid(t *testing.T) {
	res := parseNullableUUID("invalid-uuid")
	if res != nil {
		t.Errorf("parseNullableUUID(invalid) expected nil, got %v", res)
	}
}

func TestBoolToUint8(t *testing.T) {
	if got := boolToUint8(true); got != 1 {
		t.Errorf("boolToUint8(true) expected 1, got %d", got)
	}
	if got := boolToUint8(false); got != 0 {
		t.Errorf("boolToUint8(false) expected 0, got %d", got)
	}
}
