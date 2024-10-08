import csv
import requests
import json
import os
from tqdm import tqdm
import argparse
from secret import *

# Function to extract character data from the saved JSON files
def extract_character_data_from_json(json_file):
    extracted_data = []
    
    with open(json_file, 'r') as f:
        character_group = json.load(f)
        
        # Extract outer JSON fields
        group_id = character_group.get('id')
        group_url = character_group.get('url')
        group_label = character_group.get('label')  # character group name
        
        # Extract character-specific fields
        for character in character_group.get('characters', []):
            character_data = {
                'group_id': group_id,
                'group_url': group_url,
                'group_label': group_label,
                'char_id': character.get('id'),
                'web_url': character.get('image', {}).get('web_url'),
                'character_class': character.get('character_class'),
                'created_by_run_id': character.get('created_by_run_id'),
                'book_id': character.get('book', {}).get('id'),
                'x_min': character.get('x_min'),
                'x_max': character.get('x_max'),
                'y_min': character.get('y_min'),
                'y_max': character.get('y_max')
            }
            extracted_data.append(character_data)
    
    return extracted_data

# Function to read the CSV file and make API requests
def download_and_process_json(csv_file):
    extracted_all_data = []

    with open(csv_file, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in tqdm(reader, 'Downloading API JSON data'):
            printer_string = row['printer_string']
            group_ID = row['group_ID']
            
            # API URL
            api_url = f"https://printprobdb.psc.edu/api/character_groupings/{group_ID}/?format=json"
            
            # Request JSON data from API
            response = requests.get(api_url, headers={'Authorization': f'Token {API_TOKEN}'})
            
            if response.status_code == 200:
                # Save the JSON to a file named <printer_string>.json
                json_data = response.json()
                json_filename = f"{printer_string}.json"
                
                with open(json_filename, 'w') as json_file:
                    json.dump(json_data, json_file, indent=2)
                
                print(f"Saved {json_filename}")
                
                # Process the saved JSON file
                extracted_data = extract_character_data_from_json(json_filename)
                extracted_all_data.extend(extracted_data)
            else:
                print(f"Failed to retrieve data for group_ID: {group_ID}.")
                print(f"Response status code: {response.status_code}")
                print(f"Response content: {response.content}")
                print('Exiting...')
                exit(1)
    
    return extracted_all_data


# Function to process JSON files from local directory
def process_local_json_files(directory):
    extracted_all_data = []
    
    for filename in os.listdir(directory):
        if filename.endswith(".json"):
            json_file_path = os.path.join(directory, filename)
            print(f"Processing {json_file_path}")
            extracted_data = extract_character_data_from_json(json_file_path)
            extracted_all_data.extend(extracted_data)
    
    return extracted_all_data


# Function to download page images (TIFF files) from web URLs
def download_page_images(extracted_data):
    if not os.path.exists("page_images"):
        os.makedirs("page_images")

    for character in extracted_data:
        web_url = character.get("web_url")
        if web_url:
            # Extract the base URL to form the full TIFF image URL
            base_url = web_url.split(".tif")[0]
            tif_url = f"{base_url}.tif/full/max/0/default.jpg"
            
            # Create a filename for the downloaded image
            image_filename = os.path.join("page_images", base_url.split("/")[-1].replace('.tif', '') + ".jpg")
            
            # Check if the file already exists
            if os.path.exists(image_filename):
                print(f"Image {image_filename} already exists. Skipping download.")
                continue
            
            # Download the image
            try:
                response = requests.get(tif_url, headers={'Authorization': f'Token {API_TOKEN}'})
                if response.status_code == 200:
                    with open(image_filename, 'wb') as img_file:
                        img_file.write(response.content)
                    print(f"Downloaded {image_filename}")
                else:
                    print(f"Failed to download {tif_url}, status code {response.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"Error downloading {tif_url}: {e}")
                print("Exiting...")
                exit(1)


# Function to download book information
def download_book_information(extracted_data):
    books_info = []
    book_ids = set()  # To avoid duplicate book ID requests

    for character in extracted_data:
        book_id = character.get('book_id')
        if book_id and book_id not in book_ids:
            book_ids.add(book_id)
            
            # API URL for book information
            book_url = f"https://printprobdb.psc.edu/api/books/{book_id}/?format=json"
            
            # Request book information
            try:
                response = requests.get(book_url, headers={'Authorization': f'Token {API_TOKEN}'})
                if response.status_code == 200:
                    book_data = response.json()
                    books_info.append({
                        'book_id': book_id,
                        'book_data': book_data
                    })
                    print(f"Downloaded book information for book_id: {book_id}")
                else:
                    print(f"Failed to download book info for book_id: {book_id}, status code {response.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"Error downloading book info for book_id: {book_id}: {e}")
    
    # Save the books information to a JSON file
    with open('books.json', 'w') as outfile:
        json.dump(books_info, outfile, indent=2)
    
    print("Book information downloaded and saved to books.json.")


def main():
    parser = argparse.ArgumentParser(description="Download and process JSON data or load from local JSON files.")
    
    parser.add_argument('--download', action='store_true', help='Download JSON data from API and process it.')
    parser.add_argument('--load-local', action='store_true', help='Load and process JSON files from local directory "printer_jsons".')
    parser.add_argument('--download-images', action='store_true', help='Download page images from extracted web URLs.')
    parser.add_argument('--download-books', action='store_true', help='Download book information for each book_id found.')
    args = parser.parse_args()
    
    if args.download:
        csv_file = 'cdt_printers.csv'
        all_extracted_data = download_and_process_json(csv_file)
        
        # Output the extracted data to a new JSON file or print
        with open('extracted_character_data.json', 'w') as outfile:
            json.dump(all_extracted_data, outfile, indent=2)
        
        print("Data extraction from API complete.")
    
    elif args.load_local:
        all_extracted_data = process_local_json_files('printer_jsons')
        
        # Output the extracted data to a new JSON file or print
        with open('extracted_character_data.json', 'w') as outfile:
            json.dump(all_extracted_data, outfile, indent=2)
        
        print("Data extraction from local JSON files complete.")
    # else:
    #     print("Please specify either --download or --load-local.")
    
    if args.download_images:
        if not args.download and not args.load_local:
            print("Please run with --download or --load-local first to generate the extracted data.")
        else:
            download_page_images(all_extracted_data)
            print("Image download complete.")
    
    if args.download_books:
        if not args.download and not args.load_local:
            print("Please run with --download or --load-local first to generate the extracted data.")
        else:
            download_book_information(all_extracted_data)
            print("Book information download complete.")
    

if __name__ == "__main__":
    main()
