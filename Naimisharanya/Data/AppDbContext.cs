using Microsoft.EntityFrameworkCore;
using Naimisharanya.Models;

namespace Naimisharanya.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<ContactInquiry> ContactInquiries => Set<ContactInquiry>();
        public DbSet<NewsletterSubscriber> NewsletterSubscribers => Set<NewsletterSubscriber>();
    }
}
