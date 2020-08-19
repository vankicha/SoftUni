using System;
using System.Linq;
using System.Text;
using System.Collections.Generic;

using OnlineShop.Common.Constants;
using OnlineShop.Models.Products.Computers;
using OnlineShop.Models.Products.Components;
using OnlineShop.Models.Products.Peripherals;

namespace OnlineShop.Models.Products
{
    public abstract class Computer : Product, IComputer
    {
        private List<IComponent> components;
        private List<IPeripheral> peripherals;
        protected Computer(int id, string manufacturer, string model, decimal price, double overallPerformance)
            : base(id, manufacturer, model, price, overallPerformance)
        {
            this.components = new List<IComponent>();
            this.peripherals = new List<IPeripheral>();
        }

        public override double OverallPerformance => !this.Components.Any() ? base.OverallPerformance : base.OverallPerformance + this.components.Average(x => x.OverallPerformance);
        public override decimal Price => base.Price + (this.components.Any() ? this.components.Sum(x => x.Price) : 0) + (this.peripherals.Any() ? this.peripherals.Sum(x => x.Price) : 0);
        public IReadOnlyCollection<IComponent> Components => this.components;
        public IReadOnlyCollection<IPeripheral> Peripherals => this.peripherals;

        public void AddComponent(IComponent component)
        {
            if (this.components.Any(x => x.GetType().Name == component.GetType().Name))
            {
                throw new ArgumentException(string.Format(ExceptionMessages.ExistingComponent, component.GetType().Name, this.GetType().Name, this.Id));
            }

            this.components.Add(component);
        }

        public void AddPeripheral(IPeripheral peripheral)
        {
            if (this.peripherals.Any(x => x.GetType().Name == peripheral.GetType().Name))
            {
                throw new ArgumentException(string.Format(ExceptionMessages.ExistingPeripheral, peripheral.GetType().Name, this.GetType().Name, this.Id));
            }

            this.peripherals.Add(peripheral);
        }

        public IComponent RemoveComponent(string componentType)
        {
            var component = this.components.FirstOrDefault(x => x.GetType().Name == componentType);

            if (!this.components.Any() || component == null)
            {
                throw new ArgumentException(string.Format(ExceptionMessages.NotExistingComponent, componentType, this.GetType().Name, this.Id));
            }

            this.components.Remove(component);
            return component;
        }

        public IPeripheral RemovePeripheral(string peripheralType)
        {
            var peripheral = this.peripherals.FirstOrDefault(x => x.GetType().Name == peripheralType);

            if (!this.peripherals.Any() || peripheral == null)
            {
                throw new ArgumentException(string.Format(ExceptionMessages.NotExistingPeripheral, peripheralType, this.GetType().Name, this.Id));
            }

            this.peripherals.Remove(peripheral);
            return peripheral;
        }

        public override string ToString()
        {
            StringBuilder sb = new StringBuilder();

            sb.AppendLine(base.ToString());
            sb.AppendLine($" Components ({(this.components.Any() ? this.components.Count : 0)}):");

            if(this.components.Any())
            {
                foreach (var comp in this.components)
                {
                    sb.AppendLine($"  {comp}");
                }
            }

            var averageOverallPerformance = this.peripherals.Any() ? this.peripherals.Average(x => x.OverallPerformance) : 0;

            sb.AppendLine($" Peripherals ({peripherals.Count}); Average Overall Performance ({averageOverallPerformance:f2}):");

            if (this.peripherals.Any())
            {
                foreach (var peripheral in this.peripherals)
                {
                    sb.AppendLine($"  {peripheral}");
                }
            }

            return sb.ToString().TrimEnd();
        }
    }
}
