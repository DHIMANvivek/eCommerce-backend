const Sales = require('../../models/custom-website-elements/customSales');

async function setSales(req, res) {
    try {
        const incomingSalesData = req.body.sale; 

        const createdSales = await Sales.create(incomingSalesData);

        res.status(200).json({ message: "Sales inserted successfully", data: createdSales });
    } catch (error) {
        console.error('Failed to insert sales:', error);
        res.status(500).json({ message: 'Failed to insert sales' });
    }
}

async function getSales(req, res) {
    try {
        let salesData = await Sales.find();
        res.status(200).json(salesData);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Unable to get sales data.'
        });
    }
}

async function toggle(req, res) {
  try {
    const { id, enable } = req.body;
    const filter = { _id: id };
    const update = { enable: enable };

    const updatedSale = await Sales.findOneAndUpdate(filter, update, { new: true });

    if (!updatedSale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.status(200).json({ message: 'Sale updated successfully', updatedSale });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateItem(req, res) {
    try {
      const { index, data } = req.body;
  
      console.log(req.body.data);
      if (index !== undefined) {
        const salesItems = await Sales.find({}); 
        if (index >= salesItems.length) {
          return res.status(404).json({ message: 'Index out of range' });
        }
        
        const updateData = data.sale[0]; 
        const updatedItem = await Sales.findOneAndUpdate({ _id: salesItems[index]._id }, updateData, { new: true });
  
        // console.log(updatedItem, "item editable is ")

        if (!updatedItem) {
          return res.status(404).json({ message: 'Item not found' });
        }
  
        res.status(200).json({ message: 'Item updated successfully', updatedItem });
      } else {
        const newItem = await Sales.create(data);
        res.status(200).json({ message: 'New item added successfully', newItem });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async function deleteSale(req, res) {
    const { _id } = req.body;
    try {
        const deletedSale = await Sales.findByIdAndDelete(_id);
        console.log("Deleted:", deletedSale);
        res.status(200).json({ message: 'Sale deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the sale' });
    }
}

  
  
  

module.exports = {
    setSales,
    getSales,
    updateItem,
    toggle,
    deleteSale
};
