import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { GraduationCap, BookOpen, ArrowRight, ArrowLeft, KeyRound, Loader2, ShieldCheck, Sparkles } from "lucide-react";

function RoleSelectionModal() {
  const { setRole, isSettingRole } = useAuthStore();
  const [step, setStep] = useState(1); // 1 = choose role, 2 = invite code
  const [selectedRole, setSelectedRole] = useState(null);
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError("");
  };

  const handleContinue = async () => {
    if (!selectedRole) return;

    if (selectedRole === "student") {
      const result = await setRole("student");
      if (!result.success) {
        setError(result.message);
      }
      return;
    }

    // Teacher → go to step 2 for invite code
    setStep(2);
  };

  const handleVerifyCode = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter the invite code.");
      return;
    }

    setError("");
    const result = await setRole("teacher", inviteCode.trim());
    if (!result.success) {
      setError(result.message);
    }
  };

  const handleBack = () => {
    setStep(1);
    setInviteCode("");
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isSettingRole) {
      handleVerifyCode();
    }
  };

  return (
    <div
      className="role-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 58, 138, 0.88) 50%, rgba(15, 23, 42, 0.95) 100%)",
        backdropFilter: "blur(20px)",
        padding: "16px",
      }}
    >
      {/* Floating background orbs */}
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
      }}>
        <div style={{
          position: "absolute", top: "10%", left: "15%", width: "300px", height: "300px",
          borderRadius: "50%", background: "radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)",
          animation: "roleOrbFloat 8s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", right: "10%", width: "400px", height: "400px",
          borderRadius: "50%", background: "radial-gradient(circle, rgba(96, 165, 250, 0.12) 0%, transparent 70%)",
          animation: "roleOrbFloat 10s ease-in-out infinite reverse",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%", width: "200px", height: "200px",
          borderRadius: "50%", background: "radial-gradient(circle, rgba(167, 139, 250, 0.1) 0%, transparent 70%)",
          transform: "translate(-50%, -50%)", animation: "roleOrbFloat 6s ease-in-out infinite",
        }} />
      </div>

      <div
        className="role-modal-card"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: step === 1 ? "520px" : "440px",
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(148, 163, 184, 0.12)",
          borderRadius: "20px",
          padding: step === 1 ? "40px 36px" : "36px 32px",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
          transition: "max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s ease",
        }}
      >
        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div style={{ animation: "roleSlideIn 0.4s ease-out" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "56px", height: "56px", borderRadius: "16px",
                background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                marginBottom: "16px", boxShadow: "0 8px 24px rgba(37, 99, 235, 0.3)",
              }}>
                <Sparkles style={{ width: "28px", height: "28px", color: "white" }} />
              </div>
              <h2 style={{
                fontSize: "22px", fontWeight: 700, color: "#f1f5f9",
                margin: "0 0 8px 0", letterSpacing: "-0.02em",
              }}>
                Welcome to CampusConnect
              </h2>
              <p style={{
                fontSize: "14px", color: "#94a3b8", margin: 0, lineHeight: 1.5,
              }}>
                Choose your role to get started. This determines your access level.
              </p>
            </div>

            {/* Role Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
              {/* Student Card */}
              <button
                type="button"
                id="role-select-student"
                onClick={() => handleRoleSelect("student")}
                style={{
                  position: "relative",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: "12px", padding: "28px 16px", borderRadius: "16px",
                  cursor: "pointer", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: selectedRole === "student"
                    ? "linear-gradient(145deg, rgba(37, 99, 235, 0.2), rgba(96, 165, 250, 0.12))"
                    : "rgba(30, 41, 59, 0.5)",
                  border: selectedRole === "student"
                    ? "1.5px solid rgba(96, 165, 250, 0.5)"
                    : "1.5px solid rgba(148, 163, 184, 0.1)",
                  boxShadow: selectedRole === "student"
                    ? "0 0 24px rgba(37, 99, 235, 0.15), 0 4px 12px rgba(0,0,0,0.2)"
                    : "0 2px 8px rgba(0,0,0,0.15)",
                  transform: selectedRole === "student" ? "translateY(-2px)" : "none",
                }}
              >
                <div style={{
                  width: "48px", height: "48px", borderRadius: "14px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: selectedRole === "student"
                    ? "linear-gradient(135deg, #2563eb, #60a5fa)"
                    : "rgba(100, 116, 139, 0.2)",
                  transition: "all 0.25s ease",
                }}>
                  <BookOpen style={{
                    width: "24px", height: "24px",
                    color: selectedRole === "student" ? "white" : "#94a3b8",
                    transition: "color 0.25s ease",
                  }} />
                </div>
                <div>
                  <div style={{
                    fontSize: "15px", fontWeight: 600,
                    color: selectedRole === "student" ? "#e2e8f0" : "#cbd5e1",
                    transition: "color 0.25s ease",
                  }}>Student</div>
                  <div style={{
                    fontSize: "12px", color: "#64748b", marginTop: "4px",
                  }}>Join classes & learn</div>
                </div>
                {selectedRole === "student" && (
                  <div style={{
                    position: "absolute", top: "10px", right: "10px",
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: "#2563eb", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    animation: "roleCheckPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </button>

              {/* Teacher Card */}
              <button
                type="button"
                id="role-select-teacher"
                onClick={() => handleRoleSelect("teacher")}
                style={{
                  position: "relative",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: "12px", padding: "28px 16px", borderRadius: "16px",
                  cursor: "pointer", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: selectedRole === "teacher"
                    ? "linear-gradient(145deg, rgba(37, 99, 235, 0.2), rgba(96, 165, 250, 0.12))"
                    : "rgba(30, 41, 59, 0.5)",
                  border: selectedRole === "teacher"
                    ? "1.5px solid rgba(96, 165, 250, 0.5)"
                    : "1.5px solid rgba(148, 163, 184, 0.1)",
                  boxShadow: selectedRole === "teacher"
                    ? "0 0 24px rgba(37, 99, 235, 0.15), 0 4px 12px rgba(0,0,0,0.2)"
                    : "0 2px 8px rgba(0,0,0,0.15)",
                  transform: selectedRole === "teacher" ? "translateY(-2px)" : "none",
                }}
              >
                <div style={{
                  width: "48px", height: "48px", borderRadius: "14px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: selectedRole === "teacher"
                    ? "linear-gradient(135deg, #2563eb, #60a5fa)"
                    : "rgba(100, 116, 139, 0.2)",
                  transition: "all 0.25s ease",
                }}>
                  <GraduationCap style={{
                    width: "24px", height: "24px",
                    color: selectedRole === "teacher" ? "white" : "#94a3b8",
                    transition: "color 0.25s ease",
                  }} />
                </div>
                <div>
                  <div style={{
                    fontSize: "15px", fontWeight: 600,
                    color: selectedRole === "teacher" ? "#e2e8f0" : "#cbd5e1",
                    transition: "color 0.25s ease",
                  }}>Teacher</div>
                  <div style={{
                    fontSize: "12px", color: "#64748b", marginTop: "4px",
                  }}>Create & manage content</div>
                </div>
                {selectedRole === "teacher" && (
                  <div style={{
                    position: "absolute", top: "10px", right: "10px",
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: "#2563eb", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    animation: "roleCheckPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </button>
            </div>

            {/* Teacher hint */}
            {selectedRole === "teacher" && (
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 14px", borderRadius: "10px",
                background: "rgba(37, 99, 235, 0.08)",
                border: "1px solid rgba(37, 99, 235, 0.15)",
                marginBottom: "20px",
                animation: "roleSlideIn 0.3s ease-out",
              }}>
                <KeyRound style={{ width: "14px", height: "14px", color: "#60a5fa", flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.4 }}>
                  You'll need an invite code from your institution admin.
                </span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: "10px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                marginBottom: "16px", fontSize: "13px", color: "#fca5a5",
                animation: "roleShake 0.4s ease-out",
              }}>
                {error}
              </div>
            )}

            {/* Continue Button */}
            <button
              type="button"
              id="role-continue-btn"
              disabled={!selectedRole || isSettingRole}
              onClick={handleContinue}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                justifyContent: "center", gap: "8px", padding: "13px 20px",
                borderRadius: "12px", border: "none", cursor: selectedRole ? "pointer" : "not-allowed",
                fontSize: "14px", fontWeight: 600, letterSpacing: "-0.01em",
                background: selectedRole
                  ? "linear-gradient(135deg, #2563eb, #3b82f6)"
                  : "rgba(100, 116, 139, 0.2)",
                color: selectedRole ? "white" : "#64748b",
                boxShadow: selectedRole ? "0 4px 16px rgba(37, 99, 235, 0.3)" : "none",
                transition: "all 0.25s ease",
                opacity: isSettingRole ? 0.7 : 1,
              }}
            >
              {isSettingRole ? (
                <Loader2 style={{ width: "18px", height: "18px", animation: "spin 1s linear infinite" }} />
              ) : (
                <>
                  Continue
                  <ArrowRight style={{ width: "16px", height: "16px" }} />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Invite Code */}
        {step === 2 && (
          <div style={{ animation: "roleSlideInRight 0.4s ease-out" }}>
            {/* Back button */}
            <button
              type="button"
              onClick={handleBack}
              disabled={isSettingRole}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "6px 0", marginBottom: "24px",
                background: "none", border: "none", cursor: "pointer",
                fontSize: "13px", color: "#94a3b8",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => e.target.style.color = "#e2e8f0"}
              onMouseLeave={(e) => e.target.style.color = "#94a3b8"}
            >
              <ArrowLeft style={{ width: "14px", height: "14px" }} />
              Back
            </button>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "56px", height: "56px", borderRadius: "16px",
                background: "linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(96, 165, 250, 0.15))",
                marginBottom: "16px",
                border: "1px solid rgba(96, 165, 250, 0.2)",
              }}>
                <ShieldCheck style={{ width: "28px", height: "28px", color: "#60a5fa" }} />
              </div>
              <h2 style={{
                fontSize: "20px", fontWeight: 700, color: "#f1f5f9",
                margin: "0 0 8px 0", letterSpacing: "-0.02em",
              }}>
                Teacher Verification
              </h2>
              <p style={{
                fontSize: "13px", color: "#94a3b8", margin: 0, lineHeight: 1.5,
              }}>
                Enter the invite code provided by your institution administrator.
              </p>
            </div>

            {/* Code Input */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ position: "relative" }}>
                <KeyRound style={{
                  position: "absolute", left: "14px", top: "50%",
                  transform: "translateY(-50%)",
                  width: "18px", height: "18px", color: "#64748b",
                }} />
                <input
                  type="text"
                  id="invite-code-input"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value);
                    setError("");
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter invite code"
                  autoFocus
                  autoComplete="off"
                  style={{
                    width: "100%", padding: "13px 16px 13px 44px",
                    borderRadius: "12px", fontSize: "14px",
                    background: "rgba(30, 41, 59, 0.6)",
                    border: error
                      ? "1.5px solid rgba(239, 68, 68, 0.4)"
                      : "1.5px solid rgba(148, 163, 184, 0.15)",
                    color: "#e2e8f0", outline: "none",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    letterSpacing: "0.05em", fontWeight: 500,
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    if (!error) {
                      e.target.style.borderColor = "rgba(96, 165, 250, 0.4)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                    }
                  }}
                  onBlur={(e) => {
                    if (!error) {
                      e.target.style.borderColor = "rgba(148, 163, 184, 0.15)";
                      e.target.style.boxShadow = "none";
                    }
                  }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: "10px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                marginBottom: "16px", fontSize: "13px", color: "#fca5a5",
                animation: "roleShake 0.4s ease-out",
              }}>
                {error}
              </div>
            )}

            {/* Verify Button */}
            <button
              type="button"
              id="invite-code-verify-btn"
              disabled={isSettingRole || !inviteCode.trim()}
              onClick={handleVerifyCode}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                justifyContent: "center", gap: "8px", padding: "13px 20px",
                borderRadius: "12px", border: "none",
                cursor: inviteCode.trim() && !isSettingRole ? "pointer" : "not-allowed",
                fontSize: "14px", fontWeight: 600, letterSpacing: "-0.01em",
                background: inviteCode.trim()
                  ? "linear-gradient(135deg, #2563eb, #3b82f6)"
                  : "rgba(100, 116, 139, 0.2)",
                color: inviteCode.trim() ? "white" : "#64748b",
                boxShadow: inviteCode.trim() ? "0 4px 16px rgba(37, 99, 235, 0.3)" : "none",
                transition: "all 0.25s ease",
                opacity: isSettingRole ? 0.7 : 1,
              }}
            >
              {isSettingRole ? (
                <Loader2 style={{ width: "18px", height: "18px", animation: "spin 1s linear infinite" }} />
              ) : (
                <>
                  <ShieldCheck style={{ width: "16px", height: "16px" }} />
                  Verify & Continue
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes roleOrbFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes roleSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes roleSlideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes roleCheckPop {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        @keyframes roleShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(2px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default RoleSelectionModal;
