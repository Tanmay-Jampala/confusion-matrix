from sklearn.metrics import confusion_matrix, classification_report

# 1 = positive (for example, defective); 0 = negative
actual = [1]*45 + [0]*55
predicted = [1]*36 + [0]*9 + [1]*11 + [0]*44

cm = confusion_matrix(actual, predicted, labels=[0, 1])
print(cm) # rows: actual [0,1], columns: predicted [0,1]
print(classification_report(actual, predicted, zero_division=0))
