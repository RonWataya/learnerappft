// badge.js

export const displayTrainingBadge = (userData, badgeElement) => {
    // Check if userData exists and if the training_completed property is a truthy value,
    // which in this case will be 1 once the training is complete.
    if (userData && userData.training_completed === 1) {
        badgeElement.textContent = 'Training Complete';
        badgeElement.classList.remove('d-none');
        badgeElement.classList.add('bg-success');
    } else {
        badgeElement.textContent = '';
        badgeElement.classList.remove('bg-success');
        badgeElement.classList.add('bg-warning');
        badgeElement.classList.remove('d-none');
    }
};