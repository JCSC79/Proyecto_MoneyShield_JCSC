// src/middlewares/validateParams.middleware.mjs

import { validateId } from "../utils/validation.mjs";

export function validateIdParam(req, res, next) {
    const id = req.params.id;
    const result = validateId(id);
    if (!result.success) {
        return res.status(400).json({ error: result.error.message });
    }
    next();
}