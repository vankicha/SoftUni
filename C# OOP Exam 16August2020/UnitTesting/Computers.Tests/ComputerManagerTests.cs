using System;
using System.Collections.Generic;

using NUnit.Framework;

namespace Computers.Tests
{
    public class Tests
    {
        private Computer computer;
        private ComputerManager pcMan;

        [SetUp]
        public void Setup()
        {
            this.computer = new Computer("Test", "TestModel", 1.5m);
            this.pcMan = new ComputerManager();
        }

        [Test]
        public void ComputerConstructorShouldWorkProperly()
        {
            Assert.AreEqual("Test", this.computer.Manufacturer);
            Assert.AreEqual("TestModel", this.computer.Model);
            Assert.AreEqual(1.5m, this.computer.Price);
        }

        [Test]
        public void ComputerManagerConstructorShouldWorkProperly()
        {
            Assert.IsEmpty(pcMan.Computers);
        }

        [Test]
        public void ComputerManagerConstructorShouldReturnProperCount()
        {
            Assert.AreEqual(0, pcMan.Count);
        }

        [Test]
        public void AddingSamePCShouldThrowException()
        {
            this.pcMan.AddComputer(this.computer);

            Assert.Throws<ArgumentException>(() => this.pcMan.AddComputer(this.computer));
        }

        [Test]
        public void AddingNullPCShouldThrowException()
        {
            var pcMan = new ComputerManager();

            Assert.Throws<ArgumentNullException>(() => pcMan.AddComputer(null));
        }

        [Test]
        public void AddingPCShouldIncreaseCount()
        {
            pcMan.AddComputer(this.computer);

            Assert.AreEqual(1, pcMan.Count);
        }


        [Test]
        public void RemovingPCShouldDecreaseCount()
        {
            this.pcMan.AddComputer(this.computer);
            this.pcMan.RemoveComputer("Test", "TestModel");

            Assert.AreEqual(0, this.pcMan.Count);
        }

        [Test]
        public void RemovingPCShouldReturnPC()
        {
            this.pcMan.AddComputer(this.computer);

            Computer actual = pcMan.RemoveComputer("Test", "TestModel");

            Assert.AreEqual(this.computer, actual);
        }

        [Test]
        public void RemovingPCShouldReturnNull()
        {
            this.pcMan.AddComputer(this.computer);
            Assert.Throws<ArgumentException>(() => pcMan.RemoveComputer("A", "B"));
        }

        [Test]
        public void GetComputerShouldReturnProperly()
        {
            this.pcMan.AddComputer(this.computer);

            Computer actual = pcMan.GetComputer("Test", "TestModel");

            Assert.AreSame(this.computer, actual);
        }

        [Test]
        public void GetComputerShouldThrowException()
        {
            this.pcMan.AddComputer(this.computer);

            Assert.Throws<ArgumentException>(() => pcMan.GetComputer("a", "b"));
        }

        [Test]
        public void GetComputersByManufacturerShouldReturnProperCollection()
        {
            Computer computer2 = new Computer("Test", "TestModel2", 2.5m);
            Computer computer3 = new Computer("T", "B", 1);

            var pcMan = new ComputerManager();

            pcMan.AddComputer(this.computer);
            pcMan.AddComputer(computer2);
            pcMan.AddComputer(computer3);

            List<Computer> computers = new List<Computer>() { this.computer, computer2 };
            var actual = pcMan.GetComputersByManufacturer("Test");

            Assert.AreEqual(computers, actual);
        }

        [Test]
        public void GetComputersByManufacturerShouldReturnEmptyCollection()
        { 
            var actualCollection = this.pcMan.GetComputersByManufacturer("A");

            CollectionAssert.IsEmpty(actualCollection);
        }

        [Test]
        public void GetComputerShouldThrowExceptionWhenManufacturerIsNull()
        {
            this.pcMan.AddComputer(this.computer);

            Assert.Throws<ArgumentNullException>(() => pcMan.GetComputer(null, "b"));
        }

        [Test]
        public void GetComputerShouldThrowExceptionWhenModelIsNull()
        {
            this.pcMan.AddComputer(this.computer);

            Assert.Throws<ArgumentNullException>(() => pcMan.GetComputer("a", null));
        }

        [Test]
        public void GetComputersShouldThrowExceptionWhenManufacturerIsNull()
        {
            this.pcMan.AddComputer(this.computer);

            Assert.Throws<ArgumentNullException>(() => pcMan.GetComputersByManufacturer(null));
        }

    }
}
