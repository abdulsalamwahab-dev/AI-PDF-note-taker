import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new user (default plan is 'free')
export const createUser = mutation({
  args: {
    email: v.string(),
    userName: v.union(v.string(), v.null()), // 👈 Accepts string or null
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!existingUser) {
      await ctx.db.insert("users", {
        email: args.email,
        // 💡 If userName is null, it saves as "Guest" or empty string
        userName: args.userName ?? "New User", 
        imageUrl: args.imageUrl,
        plan: "free",
      });
      return "Inserted new user";
    }
    return "User already exists";
  },
});

// Get user plan
export const GetUserPlan = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    return user?.plan ?? "free";
  },
});

// Upgrade user plan to unlimited
export const upgradePlan = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) throw new Error("User not found in database.");

    await ctx.db.patch(user._id, { plan: "unlimited" });
    return "Plan upgraded successfully";
  },
});