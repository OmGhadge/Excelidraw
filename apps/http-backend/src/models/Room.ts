// import { InferSchemaType, Schema,model } from "mongoose";


// const roomSchema=new Schema(
//     {
//         name:{type:String,required:true},
//         ownerId:{type:Schema.Types.ObjectId,ref:'User',required:true},

//     },
//     {timestamps:true}
// );

// export type RoomDoc=InferSchemaType<typeof roomSchema>;
// export default model<RoomDoc>('Room',roomSchema);