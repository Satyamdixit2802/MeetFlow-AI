import nodemailer from "nodemailer"

const transport = nodemailer.createTransport({
    service : "google",
    auth : {
        user : process.env.EMAIL_USER,
        pass : process.env.EMAIL_APP_PASSWORD
    }
})

export async function emailRemindesendReminderEmail(
     ownerEmail : string,
     task : string,
     deadline : string
) : promise<void>{
   const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;">
      <h2 style="color:#7c6af7;margin-bottom:8px;">Action item reminder</h2>
      <p style="color:#444;margin-bottom:16px;">You have a pending action item:</p>
      <div style="background:#f5f5ff;border-left:3px solid #7c6af7;padding:16px;border-radius:4px;">
        <p style="margin:0 0 8px;font-weight:600;">${task}</p>
        <p style="margin:0;color:#666;font-size:14px;">Due: ${deadline}</p>
      </div>
      <p style="color:#888;font-size:12px;margin-top:24px;">
        Sent by AI Meeting Summariser
      </p>
    </div>
  `

  await transport.sendMail({
    from : `"Meeting summarizer" <${process.env.EMAIL_USER}>`,
    to : ownerEmail,
    subject : ` Action item due ${deadline}: ${task}`,
     text: `You have a pending action item: ${task}\nDue: ${deadline}`,
     html
  })


}

export async function verifyEmailConfig():Promise<boolean>{
 try {
    await transport.verify()
    return true
 } catch  {
        console.error("Email config invalid — check EMAIL_USER and EMAIL_APP_PASSWORD")
    return false

 }
}