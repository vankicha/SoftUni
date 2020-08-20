using System;

using NUnit.Framework;

namespace Store.Tests
{
    public class StoreManagerTests
    {
        private Product product;
        private StoreManager storeManager;
        [SetUp]
        public void Setup()
        {
            this.product = new Product("Test", 1, 1.5m);
            this.storeManager = new StoreManager();
        }

        [Test]
        public void ProductConstructorShouldWorkProperly()
        {
            Assert.AreEqual("Test", this.product.Name);
            Assert.AreEqual(1, this.product.Quantity);
            Assert.AreEqual(1.5m, this.product.Price);
        }

        [Test]
        public void StoreManagerShouldReturnEmptyCollection()
        {
            Assert.IsEmpty(this.storeManager.Products);
            Assert.AreEqual(0, this.storeManager.Count);
        }

        [Test]
        public void AddProductShouldIncreaseCount()
        {
            this.storeManager.AddProduct(this.product);

            Assert.AreEqual(1, this.storeManager.Count);
        }

        [Test]
        public void AddProductShouldThrowExceptionWhenProductIsNull()
        {
            Assert.Throws<ArgumentNullException>(() => this.storeManager.AddProduct(null));
        }

        [Test]
        public void AddProductShouldThrowExceptionWhenProductQuantityIsZero()
        {
            Assert.Throws<ArgumentException>(() => this.storeManager.AddProduct(new Product("Test", 0, 1.5m)));
        }

        [Test]
        public void AddProductShouldThrowExceptionWhenProductQuantityIsNegative()
        {
            Assert.Throws<ArgumentException>(() => this.storeManager.AddProduct(new Product("Test", -1, 1.5m)));
        }
        
        [Test]
        public void BuyProductShouldReturnCorrectValue()
        {
            this.storeManager.AddProduct(this.product);

            decimal actualPrice = this.storeManager.BuyProduct("Test", 1);

            Assert.AreEqual(1.5m, actualPrice);
            Assert.AreEqual(0, this.product.Quantity);
        }

        [Test]
        public void BuyProductShouldThrowExceptionWhenTheProductDoesntExist()
        {
            this.storeManager.AddProduct(this.product);

            Assert.Throws<ArgumentNullException>(() => this.storeManager.BuyProduct("Testing", 1));
        }

        [Test]
        public void BuyProductShouldThrowExceptionWhenTheQuantityIsNotEnough()
        {
            this.storeManager.AddProduct(this.product);

            Assert.Throws<ArgumentException>(() => this.storeManager.BuyProduct("Test", 2));
        }

        [Test]
        public void GetMostExpensiveProductShouldReturnCorrectValue()
        {
            Product product2 = new Product("Test2", 1, 2);

            this.storeManager.AddProduct(this.product);
            this.storeManager.AddProduct(product2);

            Product actualProduct = this.storeManager.GetTheMostExpensiveProduct();

            Assert.AreEqual(product2, actualProduct);
        }
    }
}