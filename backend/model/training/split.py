import argparse, json
from sklearn.model_selection import train_test_split

def train_test(data_path, train_path, test_path):
    with open(data_path) as f:
        data = json.load(f)
    print(len(data))
    train, test = train_test_split(data, test_size=0.2, random_state=2024)
    with open(train_path, 'w', encoding='utf8') as f:
        json.dump(train, f, ensure_ascii=False, indent=4)
    with open(test_path, 'w', encoding='utf8') as f:
        json.dump(test, f, ensure_ascii=False, indent=4)
    print(len(train), len(test))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Training')
    parser.add_argument('--data_path', type=str, help='path to file containing all annotated data')
    parser.add_argument('--train_path', type=str, help='path to where annotated train data will be stored')
    parser.add_argument('--test_path', type=str, help='path to where annotated test data will be stored')
    args = parser.parse_args()

    train_test_split(args.data_path, args.train_path, args.test_path)