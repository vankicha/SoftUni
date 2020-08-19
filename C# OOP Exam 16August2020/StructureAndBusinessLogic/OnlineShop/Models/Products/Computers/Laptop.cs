namespace OnlineShop.Models.Products
{
    public class Laptop : Computer
    {
        private const double DEF_OVERALL_PERF = 10;

        public Laptop(int id, string manufacturer, string model, decimal price) 
            : base(id, manufacturer, model, price, DEF_OVERALL_PERF)
        {
        }
    }
}
