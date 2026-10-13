using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Naimisharanya.Data;
using Naimisharanya.Models;

namespace Naimisharanya.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly AppDbContext _db;

        public HomeController(ILogger<HomeController> logger, AppDbContext db)
        {
            _logger = logger;
            _db = db;
        }

        public IActionResult Index()
        {
            ViewData["Theme"] = "divine";
            return View();
        }

        public IActionResult Dark()
        {
            ViewData["Theme"] = "dark";
            return View("Index");
        }

        public IActionResult Ivory()
        {
            ViewData["Theme"] = "clean";
            return View("Index");
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> SubmitContact()
        {
            try
            {
                // Support both standard field names and Forminator field names
                var name = Request.Form["name-1"].FirstOrDefault() ?? Request.Form["name"].FirstOrDefault() ?? string.Empty;
                var email = Request.Form["email-1"].FirstOrDefault() ?? Request.Form["email"].FirstOrDefault() ?? string.Empty;
                var phone = Request.Form["phone-1"].FirstOrDefault() ?? Request.Form["phone"].FirstOrDefault() ?? string.Empty;
                var message = Request.Form["textarea-1"].FirstOrDefault() ?? Request.Form["message"].FirstOrDefault() ?? string.Empty;

                if (string.IsNullOrWhiteSpace(name) && string.IsNullOrWhiteSpace(phone) && string.IsNullOrWhiteSpace(email))
                {
                    return Json(new { success = false, message = "Please fill in at least your name and phone number or email." });
                }

                var inquiry = new ContactInquiry
                {
                    Name = name.Trim(),
                    Email = email.Trim(),
                    Phone = phone.Trim(),
                    Message = message.Trim(),
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };

                _db.ContactInquiries.Add(inquiry);
                await _db.SaveChangesAsync();

                _logger.LogInformation("New contact inquiry received from {Name} ({Phone}, {Email})", inquiry.Name, inquiry.Phone, inquiry.Email);

                // Asynchronously dispatch email notification and devotee confirmation
                _ = Task.Run(async () =>
                {
                    try
                    {
                        using var client = new HttpClient();
                        var payload = new Dictionary<string, string>
                        {
                            ["_subject"] = $"नई नैमिषारण्य तीर्थ इन्क्वायरी - {inquiry.Name}",
                            ["_captcha"] = "false",
                            ["_template"] = "table",
                            ["नाम"] = inquiry.Name,
                            ["मोबाइल"] = inquiry.Phone,
                            ["ईमेल"] = string.IsNullOrWhiteSpace(inquiry.Email) ? "प्रदान नहीं किया गया" : inquiry.Email,
                            ["संदेश"] = inquiry.Message
                        };

                        if (!string.IsNullOrWhiteSpace(inquiry.Email))
                        {
                            payload["email"] = inquiry.Email;
                            payload["_replyto"] = inquiry.Email;
                            payload["_autoresponse"] = "सादर प्रणाम, जय श्री सीताराम!\n\nआपकी नैमिषारण्य तीर्थ दर्शन एवं पूजा-अनुष्ठान संबंधी इन्क्वायरी सफलतापूर्वक प्राप्त हो चुकी है।\n\nहमारी अधिकृत तीर्थ सेवा टीम शीघ्र ही आपसे फोन / WhatsApp पर संपर्क करेगी।\n\nतीर्थ सेवा संपर्क सूत्र:\nपंडित पुरुषोत्तम शर्मा\nफोन / व्हाट्सएप: 09935935573\nईमेल: naimishtouristservices@gmail.com\nनैमिष टूरिस्ट सर्विसेज \"नैमिषारण्य प्रवासम\" (स्था. 2005)\nनैमिषारण्य धाम, सीतापुर (उत्तर प्रदेश)";
                        }

                        var content = new FormUrlEncodedContent(payload);
                        await client.PostAsync("https://formsubmit.co/ajax/naimishtouristservices@gmail.com", content);
                    }
                    catch (Exception emailEx)
                    {
                        _logger.LogWarning(emailEx, "Background email dispatch error");
                    }
                });

                return Json(new { success = true, message = "धन्यवाद! आपका संदेश सफलतापूर्वक दर्ज कर लिया गया है। हम शीघ्र ही आपसे संपर्क करेंगे।" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving contact inquiry");
                return Json(new { success = false, message = "संदेश भेजते समय त्रुटि हुई। कृपया पुनः प्रयास करें।" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> SubscribeNewsletter()
        {
            try
            {
                var email = Request.Form["email-1"].FirstOrDefault() ?? Request.Form["email"].FirstOrDefault() ?? string.Empty;

                if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
                {
                    return Json(new { success = false, message = "कृपया एक मान्य ईमेल दर्ज करें।" });
                }

                email = email.Trim().ToLowerInvariant();

                var existing = await _db.NewsletterSubscribers.FirstOrDefaultAsync(s => s.Email == email);
                if (existing != null)
                {
                    return Json(new { success = true, message = "आप पहले से ही सब्सक्राइब हैं! धन्यवाद।" });
                }

                var subscriber = new NewsletterSubscriber
                {
                    Email = email,
                    SubscribedAt = DateTime.UtcNow,
                    IsActive = true
                };

                _db.NewsletterSubscribers.Add(subscriber);
                await _db.SaveChangesAsync();

                _logger.LogInformation("New newsletter subscriber: {Email}", email);

                return Json(new { success = true, message = "धन्यवाद! आपकी सदस्यता सफलतापूर्वक दर्ज कर ली गई है।" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving newsletter subscriber");
                return Json(new { success = false, message = "त्रुटि हुई। कृपया पुनः प्रयास करें।" });
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
