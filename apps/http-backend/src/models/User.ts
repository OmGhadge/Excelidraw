// import { Schema, model, InferSchemaType } from 'mongoose';
// const userSchema=new Schema(
//     {
//         email:{type:String,unique:true, required:true},
//         password:{type:String, required:true},
//     },
//     {timestamps:true}
// );

// export type UserDoc=InferSchemaType<typeof userSchema>;
// export default model<UserDoc>('User',userSchema);