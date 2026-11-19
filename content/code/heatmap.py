import matplotlib.pyplot as plt
from sklearn.metrics import ConfusionMatrixDisplay

display = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=['Not defective', 'Defective'])

display.plot(cmap='Blues', values_format='d')
plt.title('Confusion Matrix - Sample Classifier')
plt.tight_layout()
plt.show()
