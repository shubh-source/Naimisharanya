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
            return View();
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

        // Admin Dashboard to view all inquiries and subscribers
        [HttpGet]
        public async Task<IActionResult> Admin()
        {
            var model = new AdminDashboardViewModel
            {
                Inquiries = await _db.ContactInquiries.OrderByDescending(i => i.CreatedAt).ToListAsync(),
                Subscribers = await _db.NewsletterSubscribers.OrderByDescending(s => s.SubscribedAt).ToListAsync()
            };

            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> MarkInquiryRead(int id)
        {
            var item = await _db.ContactInquiries.FindAsync(id);
            if (item != null)
            {
                item.IsRead = true;
                await _db.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Admin));
        }

        [HttpPost]
        public async Task<IActionResult> DeleteInquiry(int id)
        {
            var item = await _db.ContactInquiries.FindAsync(id);
            if (item != null)
            {
                _db.ContactInquiries.Remove(item);
                await _db.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Admin));
        }

        [HttpPost]
        public async Task<IActionResult> DeleteSubscriber(int id)
        {
            var item = await _db.NewsletterSubscribers.FindAsync(id);
            if (item != null)
            {
                _db.NewsletterSubscribers.Remove(item);
                await _db.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Admin));
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
