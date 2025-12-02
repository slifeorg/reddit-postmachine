import pandas as pd
import os

# Поточна папка
current_dir = os.getcwd()
print(f"Поточна папка: {current_dir}")

# Шлях до файлу Excel
excel_path = os.path.join(current_dir, 'Subredit group.xlsx')
print(f"Excel файл: {excel_path}")

# Зчитуємо Excel файл з першим рядком як заголовки
df = pd.read_excel(excel_path, sheet_name='subreddit specifications')
print(f"Розмір таблиці: {df.shape}")
print(f"Колонки: {df.columns.tolist()}")

# Перевіряємо структуру даних
print("\nПерші 5 рядків для аналізу:")
print(df.head().to_string())

# Змінюємо підхід: читаємо файл без заголовків для точного аналізу
df_raw = pd.read_excel(excel_path, sheet_name='subreddit specifications', header=None)
print(f"\nРозмір необробленої таблиці: {df_raw.shape}")

# Знаходимо всі групи та їх позиції
group_positions = {}
current_group = None

for idx in range(len(df_raw)):
    cell_value = df_raw.iloc[idx, 0]
    if pd.notna(cell_value) and str(cell_value).strip().lower() == 'group':
        group_name = df_raw.iloc[idx, 1]
        if pd.notna(group_name):
            current_group = str(group_name).strip()
            group_positions[current_group] = idx
            print(f"Знайдено групу '{current_group}' на рядку {idx}")

print(f"\nЗнайдено груп: {list(group_positions.keys())}")

# Створюємо список для зберігання всіх записів
all_records = []

# Обробляємо кожну групу
for group_name, start_idx in group_positions.items():
    print(f"\nОбробляємо групу: {group_name}")
    
    # Знаходимо кінець групи (наступний 'group' або кінець файлу)
    end_idx = len(df_raw)
    for next_idx in range(start_idx + 1, len(df_raw)):
        cell_value = df_raw.iloc[next_idx, 0]
        if pd.notna(cell_value) and str(cell_value).strip().lower() == 'group':
            end_idx = next_idx
            break
    
    print(f"  Рядки: {start_idx} до {end_idx-1}")
    
    # Визначаємо позиції різних типів даних у цій групі
    data_positions = {}
    for row_idx in range(start_idx, end_idx):
        field_name = df_raw.iloc[row_idx, 0]
        if pd.notna(field_name):
            field_name_lower = str(field_name).strip().lower()
            data_positions[field_name_lower] = row_idx
    
    print(f"  Позиції полів: {data_positions}")
    
    # Знаходимо стовпці з назвами сабредітів (починаючи зі стовпця 1)
    subreddit_columns = []
    if 'sub' in data_positions:
        sub_row_idx = data_positions['sub']
        for col_idx in range(1, df_raw.shape[1]):
            sub_name = df_raw.iloc[sub_row_idx, col_idx]
            if pd.notna(sub_name) and str(sub_name).strip() != '':
                subreddit_columns.append((col_idx, str(sub_name).strip()))
    
    print(f"  Знайдено сабредітів: {len(subreddit_columns)}")
    
    # Для кожного сабредіта створюємо запис
    for col_idx, sub_name in subreddit_columns:
        record = {'group': group_name, 'sub': sub_name}
        
        # Заповнюємо інші поля з відповідних рядків
        field_mappings = {
            'title prompt': 'title_prompt',
            'titel example': 'title_example', 
            'body exclusion words': 'body_exclusion_words',
            'body example': 'body_example',
            'rules': 'rules',
            'ruls': 'rules',
            'prompt': 'prompt'
        }
        
        for field_raw, field_final in field_mappings.items():
            if field_raw in data_positions:
                row_idx = data_positions[field_raw]
                value = df_raw.iloc[row_idx, col_idx]
                if pd.notna(value):
                    record[field_final] = str(value)
                else:
                    record[field_final] = ''
        
        # Додаємо обов'язкові поля
        record['usage_count'] = 0
        record['success_rate'] = 0
        record['is_active'] = 1
        
        all_records.append(record)
        print(f"    Додано: {sub_name}")

# Створюємо DataFrame
if all_records:
    result_df = pd.DataFrame(all_records)
    
    # Приводимо значення group до правильного формату
    def format_group(group):
        if pd.isna(group):
            return 'Other'
        group_lower = str(group).strip().lower()
        if group_lower == 'east':
            return 'East'
        elif group_lower == 'west':
            return 'West'
        elif group_lower == 'pacific':
            return 'Pacific'
        elif group_lower == 'canada':
            return 'Canada'
        else:
            return group  # Залишаємо як є
    
    result_df['group'] = result_df['group'].apply(format_group)
    
    # Додаємо числові поля
    result_df['usage_count'] = 0
    result_df['success_rate'] = 0
    result_df['is_active'] = 1
    
    # Вибираємо потрібні стовпці у правильному порядку
    final_columns = ['group', 'sub', 'title_prompt', 'title_example', 
                     'body_exclusion_words', 'body_example', 'rules', 
                     'prompt', 'usage_count', 'success_rate', 'is_active']
    
    # Перевіряємо наявність всіх стовпців
    for col in final_columns:
        if col not in result_df.columns:
            result_df[col] = ''
    
    result_df = result_df[final_columns]
    
    # Зберігаємо результат
    output_path = os.path.join(current_dir, 'subreddit_templates_all.csv')
    result_df.to_csv(output_path, index=False, encoding='utf-8')
    
    print(f"\n{'='*60}")
    print(f"Успішно створено CSV файл: {output_path}")
    print(f"Кількість записів: {len(result_df)}")
    
    # Статистика по групах
    print("\nРозподіл по групах:")
    group_counts = result_df['group'].value_counts()
    for group, count in group_counts.items():
        print(f"  {group}: {count} сабредітів")
    
    print("\nПерші 5 записів:")
    print(result_df.head().to_string())
    
    # Перевіряємо унікальність
    print(f"\nУнікальних сабредітів: {result_df['sub'].nunique()}")
    total = len(result_df)
    unique = result_df['sub'].nunique()
    if total != unique:
        print(f"Дублікатів: {total - unique}")
        duplicates = result_df[result_df['sub'].duplicated(keep=False)]
        print("\nДублікати:")
        print(duplicates[['group', 'sub']].sort_values('sub').to_string(index=False))
        
        # Зберігаємо окремо файл з дублікатами для перегляду
        duplicates_path = os.path.join(current_dir, 'duplicates_report.csv')
        duplicates.to_csv(duplicates_path, index=False, encoding='utf-8')
        print(f"\nЗвіт про дублікати збережено: {duplicates_path}")
else:
    print("Не знайдено жодних записів для імпорту!")

# Створюємо альтернативну версію з унікальними записами
if all_records:
    # Робимо унікальні записи (за назвою сабредіта)
    unique_records = []
    seen_subs = set()
    
    for record in all_records:
        sub = record['sub']
        if sub not in seen_subs:
            unique_records.append(record)
            seen_subs.add(sub)
    
    unique_df = pd.DataFrame(unique_records)
    unique_df['group'] = unique_df['group'].apply(format_group)
    unique_df['usage_count'] = 0
    unique_df['success_rate'] = 0
    unique_df['is_active'] = 1
    
    # Вибір стовпців
    for col in final_columns:
        if col not in unique_df.columns:
            unique_df[col] = ''
    
    unique_df = unique_df[final_columns]
    
    # Зберігаємо унікальну версію
    unique_path = os.path.join(current_dir, 'subreddit_templates_unique.csv')
    unique_df.to_csv(unique_path, index=False, encoding='utf-8')
    
    print(f"\nУнікальна версія (без дублікатів) збережена: {unique_path}")
    print(f"Унікальних записів: {len(unique_df)}")