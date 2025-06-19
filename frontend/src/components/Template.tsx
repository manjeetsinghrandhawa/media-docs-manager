import { FcGoogle } from "react-icons/fc";
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
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-4 sm:px-6">
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="mx-auto flex w-full max-w-maxContent flex-col-reverse justify-between gap-y-8 sm:gap-y-12 py-6 sm:py-12 md:flex-row md:gap-y-0 md:gap-x-12">
          <div className="mx-auto w-full max-w-[450px] md:mx-0">
            <h1 className="text-[1.5rem] sm:text-[1.875rem] font-semibold leading-[2rem] sm:leading-[2.375rem] text-richblack-5">
              {title}
            </h1>
            <p className="mt-3 sm:mt-4 text-[1rem] sm:text-[1.125rem] leading-[1.5rem] sm:leading-[1.625rem]">
              <span className="text-richblack-100">{description1}</span>{" "}
              <span className="font-edu-sa font-bold italic text-blue-100">
                {description2}
              </span>
            </p>
            {formType === "signup" ? <SignupForm /> : <LoginForm />}
          </div>

          <div className="relative mx-auto w-full max-w-[450px] md:mx-0">
            <div className="w-full h-[250px] sm:h-[300px] md:h-[400px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center p-4">
              <img
                src={image}
                alt="Authentication"
                width={400}
                height={300}
                loading="lazy"
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Template;
