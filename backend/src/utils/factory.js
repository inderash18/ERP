export const getAll = (Model) => async (req, res) => {
  try {
    const docs = await Model.find({ organizationId: req.organizationId });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getOne = (Model, popOptions) => async (req, res) => {
  try {
    let query = Model.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    
    if (!doc) {
      return res.status(404).json({ success: false, error: { message: 'Document not found' } });
    }
    
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const createOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.create({ ...req.body, organizationId: req.organizationId });
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const updateOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!doc) {
      return res.status(404).json({ success: false, error: { message: 'Document not found' } });
    }
    
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const deleteOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
    
    if (!doc) {
      return res.status(404).json({ success: false, error: { message: 'Document not found' } });
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
