using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Threading.Tasks;

public class EmailService
{
    private readonly string sendGridApiKey = "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";
    //private readonly string sendGridApiKey = "YOUR API KEY";

    public async Task SendEmailAsync(string recipientEmail, string subject, string body, byte[] attachmentBytes)
    {
        var client = new SendGridClient(sendGridApiKey);
        var from = new EmailAddress("shreyanshimishra7689@gmail.com", "Evalueserve");
        var to = new EmailAddress(recipientEmail);
        var msg = MailHelper.CreateSingleEmail(from, to, subject, body, body);


        if (attachmentBytes != null && attachmentBytes.Length > 0)
        {
            var attachment = Convert.ToBase64String(attachmentBytes);
            msg.AddAttachment("ticket.pdf", attachment, "attachment/pdf"); // ✅ Attach PDF
        }


        var response = await client.SendEmailAsync(msg);
        Console.WriteLine($"✅ Email sent with status: {response.StatusCode}");
    }
}