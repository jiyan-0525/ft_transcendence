export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export type FriendRequest = {
  id: number;
  requesterId: number;
  requester_username: string;
  addresseeId: number;
  addressee_username: string;
  status: FriendRequestStatus;
  createdAt: string;
};

export type Friend = {
  id: number;
  userId: number;
  since: string;
}

