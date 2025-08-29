import os
import json
from datetime import datetime, timedelta
import random
import hashlib

# Path to the root directory where the PDF files and folders are stored
root_dir = 'path_to_your_directory'

def generate_file_id(file_name):
    """Generate a unique file ID based on the file name."""
    return hashlib.md5(file_name.encode()).hexdigest()[:6]

def random_date(start_date, end_date):
    """Generate a random date between start_date and end_date."""
    delta = end_date - start_date
    random_days = random.randint(0, delta.days)
    return start_date + timedelta(days=random_days)

def scan_directory(directory):
    """Scan directory and gather file details."""
    file_data = []
    start_date = datetime(2024, 8, 1)  # Starting from August 2024
    end_date = datetime.now()  # Up to today's date
    
    for root, dirs, files in os.walk(directory):
        category = os.path.basename(root)  # Folder name is used as category
        for file in files:
            if file.endswith('.pdf'):  # Filter only PDF files
                file_path = os.path.join(root, file)
                file_id = generate_file_id(file)
                
                # Generate random upload date and download count
                upload_date = random_date(start_date, end_date).strftime("%Y-%m-%d")
                downloads = random.randint(300, 500)
                
                file_details = {
                    "id": file_id,
                    "name": file,
                    "title": file.replace('.pdf', '').replace('-', ' ').title(),
                    "category": category,
                    "subcategory": "",  # Subcategories can be added if needed
                    "description": "",  # You can add a custom description if needed
                    "url": os.path.relpath(file_path, root_dir),
                    "uploadDate": upload_date,
                    "size": f"{os.path.getsize(file_path) / (1024 * 1024):.2f}MB",
                    "downloads": downloads
                }
                file_data.append(file_details)
    return file_data

def save_to_json(data, json_file):
    """Save the collected file data to a JSON file."""
    with open(json_file, 'w') as f:
        json.dump({"files": data}, f, indent=4)

# Scan the directory and generate the file list
file_list = scan_directory(root_dir)

# Save the generated list to 'files-index1.json'
save_to_json(file_list, 'files-index1.json')

print("Index file 'files-index1.json' has been created successfully.")
