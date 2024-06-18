export default function isAdmin(req, res, next) {
  try {
    if (!req.user.isAdmin) {
      return res
        .status(401)
        .json({ message: "You are not authorized/Not an admin" });
    }
    next();
  } catch (error) {
    console.log("error in the admin middleware", error);
    res.status(500).json(error);
  }
}
