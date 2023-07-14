import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { model, Model, Schema } from 'mongoose';
import { hash, compare } from 'bcryptjs';


const SALT_ROUND = 10;
const authSchema: Schema = new Schema(
  {
    username: { type: String },
    uId: { type: String },
    email: { type: String },
    password: { type: String },
    avatarColor: { type: String },
    createdAt: { type: String, default: Date.now },
  },
  {
    toJSON: {   // this toJSON object will help use to delete the password from response object when we show
      transform(_doc, ret) {     // the user details. so the transform method can also be used to delete other fields.
        delete ret.password;
        return ret;
      }
    }
  }
);


authSchema.pre('save', async function (this: IAuthDocument, next: () => void) {
  const hashedPasword: string = await hash(this.password as string, SALT_ROUND);
  this.password = hashedPasword;
  next();
});


authSchema.methods.camparePassword = async function (password: string): Promise<boolean> {
  const hashedPasword: string = (this as unknown as IAuthDocument).password!;
  return compare(password, hashedPasword);
};

authSchema.methods.hashPassword = async function (password: string): Promise<string> {
  return hash(password, SALT_ROUND);
};


const AuthModel: Model<IAuthDocument> = model<IAuthDocument>('Auth', authSchema,'Auth');
export { AuthModel };

