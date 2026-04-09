import { SignUp } from "@clerk/clerk-react";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";

function SignUpPage() {
  return (
    <div className="w-full min-h-[100dvh] bg-zinc-900">
      <div className="w-full min-h-[100dvh]">
        <BorderAnimatedContainer fullScreen>
          <div className="w-full min-h-[100dvh] flex flex-col md:flex-row bg-zinc-900">
            <div className="w-full md:w-1/2 p-6 md:p-8 flex items-center justify-center overflow-y-auto bg-zinc-900">
              <SignUp
                path="/signup"
                routing="path"
                signInUrl="/login"
                forceRedirectUrl="/chat"
              />
            </div>

            <div className="hidden md:w-1/2 md:flex items-center justify-center p-8 bg-zinc-900">
              <div>
                <img
                  src="/signup.png"
                  alt="People using mobile devices"
                  className="w-full max-h-[70vh] h-auto object-contain"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-zinc-100">
                    Start Your Journey Today
                  </h3>

                  <div className="mt-4 flex justify-center gap-4">
                    <span className="auth-badge">Free</span>
                    <span className="auth-badge">Easy Setup</span>
                    <span className="auth-badge">Private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default SignUpPage;
