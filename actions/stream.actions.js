"use server";

import { currentUser } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";
import prisma from "@/lib/prisma";


const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;


export const tokenProvider = async () => {
  const user = await currentUser();

  if (!user) throw new Error("User is not logged in");
  if (!apiKey) throw new Error("No API Key");
  if (!apiSecret) throw new Error("No API Secret Key");

  const client = new StreamClient(apiKey, apiSecret);

  const exp = Math.round(new Date().getTime() / 1000) + 60 * 60;
  const issued = Math.floor(Date.now() / 1000) - 60;

  const createdAt = user.createdAt;
  const updatedAt = user.updatedAt;
  const createdAtDate = new Date(createdAt);
  const updatedAtDate = new Date(updatedAt);
  const email = user.emailAddresses[0]?.emailAddress || '';
  const verificationStrategy = user.emailAddresses[0]?.verification?.strategy;

  let prismaUser = await prisma.Account.findUnique({
    where: {
      user_id : user.id,
    },
  });

    // Create a new user record
  if (!prismaUser) {
    const prismauser = await prisma.Account.create({
      data: {
        user_id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        image: user.imageUrl,
        email: email, // Ensure this exists and handle potential errors
        account_type: verificationStrategy,
        created_at: createdAtDate,
        updated_at: updatedAtDate,
      },
    })
  
    console.log(prismauser)
  };
  const token = client.createToken(user.id, exp, issued);
  return token;
};
