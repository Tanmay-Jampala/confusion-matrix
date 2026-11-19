tn, fp, fn, tp = cm.ravel()
total = tn + fp + fn + tp

accuracy = (tp + tn) / total
error_rate = (fp + fn) / total
precision = tp / (tp + fp) if (tp + fp) else 0
recall = tp / (tp + fn) if (tp + fn) else 0
specificity = tn / (tn + fp) if (tn + fp) else 0
f1 = (2 * precision * recall / (precision + recall)
      if (precision + recall) else 0)
print('Accuracy:', accuracy)
print('Error rate:', error_rate)
print('Precision:', precision)
print('Recall:', recall)
print('F1-score:', f1)
print('Specificity:', specificity)
