
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("createdBy"); // optional
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};
