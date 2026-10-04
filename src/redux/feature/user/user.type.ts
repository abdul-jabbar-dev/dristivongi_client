type TUserType = {
    id: string;
    fullName: string;
    userName: string;
    email: string;
    phoneNumber?: string;
    createdAt?: string;
    userProfile?: {
        bio?: string;
        location?: string;
        website?: string;
        profilePicture?: string;
        coverPicture?: string;
    };
    _count?: {
        cases: number;
        claims: number;
        evidence: number;
    };
}
export type { TUserType }