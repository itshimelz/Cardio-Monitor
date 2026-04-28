from backend_features import NORMAL_REFERENCE_VALUES, PRIMARY_METRICS, SECONDARY_METRICS


def visualizationpreprocess(encoded_features, _result):
    normal_value1 = [NORMAL_REFERENCE_VALUES[metric] for metric in PRIMARY_METRICS]
    user_value1 = [float(encoded_features[metric]) for metric in PRIMARY_METRICS]

    normal_value2 = [NORMAL_REFERENCE_VALUES[metric] for metric in SECONDARY_METRICS]
    user_value2 = [float(encoded_features[metric]) for metric in SECONDARY_METRICS]

    list1 = [normal_value1, user_value1]
    list2 = [normal_value2, user_value2]
    return list1, list2
