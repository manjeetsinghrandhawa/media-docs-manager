import { useSelector } from "react-redux";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { RootState } from "../store";

interface TemplateProps {
  title: string;
  description1: string;
  description2: string;
  image: string;
  formType: "signup" | "login";
}

const Template: React.FC<TemplateProps> = ({
  title,
  description1,
  description2,
  image,
  formType,
}) => {
  // Type the useSelector to your RootState
  const { loading } = useSelector((state: RootState) => state.auth);

  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-8 sm:px-6">
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-[1.05fr_0.95fr]">
          <section className="surface-card fade-up p-6 sm:p-8">
            <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-200 sm:text-lg">
              <span>{description1}</span>{" "}
              <span className="font-semibold text-cyan-200">
                {description2}
              </span>
            </p>

            <div className="my-6 h-px w-full bg-slate-300/20" />
            {formType === "signup" ? <SignupForm /> : <LoginForm />}
          </section>

          <aside className="surface-card fade-up relative overflow-hidden p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Why teams choose this platform</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li className="surface-soft p-3">Fast upload workflows for media and documents.</li>
              <li className="surface-soft p-3">Built-in preview tools with category filters.</li>
              <li className="surface-soft p-3">Secure account flow with OTP verification.</li>
            </ul>

            <div className="mt-6 rounded-2xl border border-slate-300/20 bg-slate-900/60 p-3">
              <img
                src={image}
                alt="Authentication"
                width={400}
                height={300}
                loading="lazy"
                className="h-[250px] w-full rounded-xl object-cover shadow-lg sm:h-[320px]"
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Template;
