import nodemailer from "nodemailer";

// Define the type for the mail sending function
const mailSender = async (
  email: string,
  title: string,
  body: string
): Promise<nodemailer.SentMessageInfo | void> => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER!,
        pass: process.env.MAIL_PASS!,
      },
    });

    const info = await transporter.sendMail({
      from: "Manjeet Singh",
      to: email,
      subject: title,
      html: body,
    });

    console.log(info);
    return info;
  } catch (error: any) {
    console.error(error.message);
  }
};

export default mailSender;
