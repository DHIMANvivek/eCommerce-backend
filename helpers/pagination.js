function paginateResults(model, page, pageSize) {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;
    return model.find({}).skip(skip).limit(limit);
  }
  
  module.exports = paginateResults;