import ENV from './config';

export function resolveMediaUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        // Transform Supabase S3 raw URLs to public object URLs
        if (url.includes('.storage.supabase.co/')) {
            return url.replace('.storage.supabase.co/', '.supabase.co/storage/v1/object/public/');
        }
        return url;
    }
    if (url.startsWith('drishtivongi-bucket/')) {
        return `https://edvznvhxoaqflmxembnl.supabase.co/storage/v1/object/public/${url}`;
    }

    // Remove leading slash if present to avoid double slashes
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${ENV.BASE_URL}/${cleanUrl}`;
}

export const getAvatarUrl = (user: any): string => {
    const defaultImg = '/profile/default_profile.png';
    if (!user) return defaultImg;
    const pic = user.userProfile?.profilePicture || user.avatar || user.profilePicture;
    if (pic) return resolveMediaUrl(pic);
    
    return defaultImg;
};

export const toBengaliNumber = (num: number | string): string => {
    const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(d => /[0-9]/.test(d) ? digits[parseInt(d)] : d).join('');
};

const BENGALI_MONTHS = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

export const formatBengaliTime = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) return 'অজানা সময়';
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'অজানা সময়';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
        if (diffInSeconds <= 5) return 'এইমাত্র';
        return `${toBengaliNumber(diffInSeconds)} সেকেন্ড আগে`;
    } else if (diffInMinutes < 60) {
        const remainingSeconds = diffInSeconds % 60;
        if (remainingSeconds === 0) {
            return `${toBengaliNumber(diffInMinutes)} মিনিট আগে`;
        }
        return `${toBengaliNumber(diffInMinutes)} মিনিট ${toBengaliNumber(remainingSeconds)} সেকেন্ড আগে`;
    } else if (diffInHours < 24) {
        return `${toBengaliNumber(diffInHours)} ঘণ্টা আগে`;
    } else if (diffInDays === 1) {
        return 'গতকাল';
    } else if (diffInDays <= 7) {
        return `${toBengaliNumber(diffInDays)} দিন আগে`;
    } else {
        // Absolute date for anything older than 7 days
        const day = toBengaliNumber(date.getDate());
        const month = BENGALI_MONTHS[date.getMonth()];
        const year = toBengaliNumber(date.getFullYear());
        return `${day} ${month}, ${year}`;
    }
};

export const removeHashtags = (text: string | undefined | null, tagsToRemove?: string[]): string => {
    if (!text) return '';
    if (!tagsToRemove || tagsToRemove.length === 0) {
        return text; // Don't try to strip blindly anymore
    }
    
    let result = text;
    tagsToRemove.forEach(tag => {
        const regex = new RegExp(`#${tag}(?!\\p{L}|\\p{N}|_)`, 'gui');
        result = result.replace(regex, '');
    });
    
    return result;
};
