namespace OnlineShop.Models.Products
{
    public class DesktopComputer : Computer
    {
        private const double DEF_OVERALL_PERF = 15;
        public DesktopComputer(int id, string manufacturer, string model, decimal price) 
            : base(id, manufacturer, model, price, DEF_OVERALL_PERF)
        {
        }
    }
}
