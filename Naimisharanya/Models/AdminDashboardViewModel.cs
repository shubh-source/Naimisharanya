namespace Naimisharanya.Models
{
    public class AdminDashboardViewModel
    {
        public List<ContactInquiry> Inquiries { get; set; } = new();
        public List<NewsletterSubscriber> Subscribers { get; set; } = new();
        public int TotalInquiries => Inquiries.Count;
        public int UnreadInquiries => Inquiries.Count(i => !i.IsRead);
        public int TotalSubscribers => Subscribers.Count;
    }
}
