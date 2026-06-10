const jobs = new Map();

const createJob = (jobId, data) => {
  jobs.set(jobId, {
    jobId,
    ...data,
    createdAt: new Date(),
    status: 'pending',
  });
  return jobs.get(jobId);
};

const getJob = (jobId) => jobs.get(jobId);

const updateJob = (jobId, updates) => {
  const job = jobs.get(jobId);
  if (!job) return null;
  const updated = { ...job, ...updates };
  jobs.set(jobId, updated);
  return updated;
};

module.exports = { createJob, getJob, updateJob };
