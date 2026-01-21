export const normalizeSkills = (skills = []) => {
  const cleaned = skills
    .filter(Boolean)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);

  return [...new Set(cleaned)];
};

export const sanitizeUser = (user) => {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
};

export const overlapCount = (teach = [], learn = []) => {
  const teachSet = new Set(teach?.map((s) => s.toLowerCase()));
  const learnSet = new Set(learn?.map((s) => s.toLowerCase()));
  let count = 0;
  teachSet.forEach((skill) => {
    if (learnSet.has(skill)) count += 1;
  });
  return count;
};

