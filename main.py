import requests
import xml.etree.ElementTree as ET


url1 = 'https://www.ak-cent.kz/export/Exchange/article_all/Ware0022.xml'
url2 = 'https://al-style.kz/upload/catalog_export/al_style_catalog.php'

try:
    response1 = requests.get(url1)
    tree1 = ET.ElementTree(ET.fromstring(response1.content))
    
    response2 = requests.get(url2)
    tree2 = ET.ElementTree(ET.fromstring(response2.content))


    root1 = tree1.getroot()
    root2 = tree2.getroot()

    for child in root2:
        root1.append(child)


    combined_tree = ET.ElementTree(root1)

   
    combined_file_path = 'C:/Рабочий стол/theme/combined_file.xml'
    combined_tree.write(combined_file_path, encoding='utf-8', xml_declaration=True)
    print('Файл успешно объединен и сохранен:', combined_file_path)

except Exception as e:
    print('Произошла ошибка:', e)
