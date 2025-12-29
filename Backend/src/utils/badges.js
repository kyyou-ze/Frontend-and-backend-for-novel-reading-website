import Novel from '../models/Novel.js';
import User from '../models/User.js';

export const updateAuthorBadges = async (authorId) => {
  try {
    const novels = await Novel.find({ author: authorId });
    const user = await User.findById(authorId);

    if (!user) return;

    const badges = [];

    // Total views
    const totalViews = novels.reduce((sum, n) => sum + n.views, 0);
    if (totalViews >= 100000) badges.push('⭐ 100K Views');
    else if (totalViews >= 50000) badges.push('⭐ 50K Views');
    else if (totalViews >= 10000) badges.push('⭐ 10K Views');

    // Total novels
    if (novels.length >= 10) badges.push('📚 Prolific Writer');
    else if (novels.length >= 5) badges.push('📚 Active Writer');

    // Average rating
    const avgRating = novels.reduce((sum, n) => sum + n.rating.average, 0) / novels.length;
    if (avgRating >= 4.5) badges.push('⭐ Top Rated');

    // Completed novels
    const completedNovels = novels.filter(n => n.status === 'completed').length;
    if (completedNovels >= 3) badges.push('✅ Finisher');

    user.badges = badges;
    await user.save();

    return badges;
  } catch (error) {
    console.error('Badge update error:', error);
  }
};