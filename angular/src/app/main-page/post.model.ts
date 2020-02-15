import { User } from '../user/user.model';
import { Hashtag } from './hashtag.model';

export class Post {
  postId: number;
  description: string;
  postStatus: string;
  postImage: string;
  eventLocation: string;
  eventName: string;
  postCreatedAt: Date;
  postUpdatedAt: Date;
  user: User;
  hashtag: Hashtag;
  reason?: string;

  constructor(id: number, description: string, status: string, image: string, createdAt: Date,
              updatedAt: Date, eventLocation: string, eventName, user: User, hashtag: Hashtag,
              reason?: string) {
    this.postId = id;
    this.description = description;
    this.postStatus = status;
    this.postImage = image;
    this.eventLocation = eventLocation;
    this.eventName = eventName;
    this.postCreatedAt = createdAt;
    this.postUpdatedAt = updatedAt;
    this.user = user;
    this.hashtag = hashtag;
    this.reason = reason;
  }
}
