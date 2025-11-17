import jwt from "jsonwebtoken";

export const authenticateWS = (token) => {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // { id, email, etc. }
  } catch {
    return null;
  }
};
