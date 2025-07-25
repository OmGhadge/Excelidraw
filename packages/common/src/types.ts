import {z} from "zod";

export const CreateUserSchema=z.object({
    username:z.string().min(3).max(20),
    password:z.string(),
    email:z.string().email(),
    photo: z.string().optional(),
});

export const SigninSchema=z.object({
    email:z.string().email(),
    password:z.string(),    
});

export const CreateRoomSchema=z.object({
    name:z.string().min(3).max(20)
});

export default {};