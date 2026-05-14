import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { signAccessToken } from "../../utils/jwt.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true
};

export async function signup(input: { name: string; email: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) {
    throw new ApiError(409, "Email is already registered");
  }

  const password = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password
    },
    select: userSelect
  });

  return {
    user,
    token: signAccessToken({ userId: user.id })
  };
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isValid = await bcrypt.compare(input.password, user.password);

  if (!isValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { password: _password, ...safeUser } = user;

  return {
    user: safeUser,
    token: signAccessToken({ userId: user.id })
  };
}
