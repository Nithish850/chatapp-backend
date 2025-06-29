import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { IUserData } from 'src/interface/auth.interface';

@Table({
  tableName: 'user_data',
  timestamps: true,
})
export class UserDataModel extends Model<IUserData> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  user_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  pass_word: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  is_active: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  last_logged_in: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  ip_address: string;
}
