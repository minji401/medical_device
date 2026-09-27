const nodemailer = require("nodemailer");

const PASSWORD_RULE = "비밀번호는 8자 이상이며 영문 대문자, 소문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.";

function passwordError(password) {
  const value = String(password || "");
  if (
    value.length < 8
    || !/[a-z]/.test(value)
    || !/[A-Z]/.test(value)
    || !/\d/.test(value)
    || !/[^A-Za-z0-9]/.test(value)
  ) {
    return PASSWORD_RULE;
  }
  return "";
}

function mailConfigured() {
  return Boolean(process.env.EMAIL_HOST && process.env.EMAIL_HOST_USER && process.env.EMAIL_HOST_PASSWORD);
}

async function sendResetMail(to, link, siteName) {
  const port = Number(process.env.EMAIL_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_HOST_USER,
      pass: process.env.EMAIL_HOST_PASSWORD
    }
  });
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_HOST_USER,
    to,
    subject: siteName + " 비밀번호 재설정",
    text: "아래 주소에서 새 비밀번호를 정해 주세요. 이 링크는 30분 뒤에 만료됩니다.\n\n"
      + link
      + "\n\n본인이 요청하지 않았다면 이 메일을 무시하세요."
  });
}

module.exports = { PASSWORD_RULE, passwordError, mailConfigured, sendResetMail };
